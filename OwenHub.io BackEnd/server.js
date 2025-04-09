const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const { ObjectId } = require("mongodb");


const unzipper = require("unzipper");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

const mongoURI = "mongodb://localhost:27017/"; // use your actual URI
mongoose.connect(mongoURI).then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ Connection error:", err));

const REPO_DIR = path.join(__dirname, "repos");

// Ensure repo directory exists
if (!fs.existsSync(REPO_DIR)) {
    fs.mkdirSync(REPO_DIR, { recursive: true });
}
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const repoName = file.originalname.replace(".zip", "");
            const repoFile = {
                bucketName: 'repositories', // Choose the collection name
                filename: file.originalname,
                metadata: {
                    repoName: repoName,
                    description: req.body.description || "No description provided"
                }
            };
            resolve(repoFile);
        });
    }
});

const upload = multer({ storage });
const upload2 = multer({ dest: "temp_uploads/" });

const repositorySchema = new mongoose.Schema({
    name: String,
    description: String,
    fileId: mongoose.Schema.Types.ObjectId, // Reference to the file in GridFS
});



const Repository = mongoose.model("Repository", repositorySchema);

const commentSchema = new mongoose.Schema({
    repoId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Repository" },
    author: { type: String, default: "Anonymous" },
    content: { type: String, required: true },
    rating: {type: Number, required:true},
    createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);


let repositories = [];


app.get("/repositories/commentsList", async (req, res) => {
    try {
        const comments = await Comment.find().sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        console.error("Failed to fetch comments:", err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});





app.get("/repositories", async (req, res) => {
    const repositories = await Repository.find();
    res.json(repositories);
});


// 📄 Get metadata for a single repository
app.get("/repositories/:repoId", async (req, res) => {
    const repoId = req.params.repoId;
    
  
    const repoPath = path.join(REPO_DIR, repoId);

     // Check if the repository exists in MongoDB
     const repo = await Repository.findOne({ _id: repoId });
     if (!repo) {
         return res.status(404).json({ error: "Repository not found" });
     }

    // Read README.md if it exists as a placeholder for description
    let description = "No description provided";
    const readmePath = path.join(repoPath, "README.md");
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, "utf-8");
        const firstLine = content.split("\n")[1]; // skip title, grab second line
        if (firstLine) description = firstLine.trim();
    }

    const repoReturned = {
        id: repoId,
        name: repo.name,
        description,
        folder: repoId,
    };

    res.json(repo);
});




// Recursive function to get files and directories

const getFilesRecursively = (repoPath) => {
  const files = fs.readdirSync(repoPath, { withFileTypes: true });
  const fileList = [];

  files.forEach((file) => {
    const fullPath = path.join(repoPath, file.name);

    if (file.isDirectory()) {
      // If it's a directory, recursively get its contents
      fileList.push({
        name: file.name,
        isDirectory: true,
        children: getFilesRecursively(fullPath), // Recursive call
      });
    } else {
      let content = null;
      try {
        // Read file content as UTF-8 (you can adjust based on file type)
        content = fs.readFileSync(fullPath, "utf8");
      } catch (err) {
        content = "[Error reading file]";
      }

      fileList.push({
        name: file.name,
        isDirectory: false,
        content: content, // Include file content
      });
    }
  });

  return fileList;
};

  
app.get("/repositories/:repoId/files", async (req, res) => {
    const { repoId } = req.params;
    const { path: basePath = "" } = req.query;

    try {
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: "repositories",
        });

        const files = await db.collection("repositories.files").find({
            "metadata.repoId": new ObjectId(repoId)
        }).toArray();

        const normalizedBase = basePath.endsWith("/") ? basePath : basePath + "/";
        const relevantFiles = files.filter(file =>
            !basePath || (file.metadata.path && file.metadata.path.startsWith(normalizedBase))
        );

        const buildTree = async (fileList) => {
            const tree = {};

            for (const file of fileList) {
                const filePath = file.metadata.path || file.filename;
                const parts = filePath.split("/");
                let current = tree;

                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        // Fetch content from GridFS
                        const chunks = [];
                        await new Promise((resolve, reject) => {
                            bucket.openDownloadStream(file._id)
                                .on("data", (chunk) => chunks.push(chunk))
                                .on("end", () => resolve())
                                .on("error", (err) => reject(err));
                        });

                        const content = Buffer.concat(chunks).toString("utf8");

                        current[part] = {
                            name: part,
                            isDirectory: false,
                            _id: file._id,
                            content: content,
                        };
                    } else {
                        if (!current[part]) {
                            current[part] = { name: part, isDirectory: true, children: {} };
                        }
                        current = current[part].children;
                    }
                }
            }

            const formatTree = (node) =>
                Object.values(node).map(item => ({
                    name: item.name,
                    isDirectory: item.isDirectory,
                    ...(item.isDirectory
                        ? { children: formatTree(item.children) }
                        : { _id: item._id, content: item.content })
                }));

            return formatTree(tree);
        };

        const fileTree = await buildTree(relevantFiles);
        res.json(fileTree);

    } catch (err) {
        console.error("Error accessing files:", err);
        res.status(500).json({ error: "Error accessing repository files." });
    }
});

  



// Endpoint to create a repository, initialize a folder, and create a README file
app.post("/create-repo", async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Repository name is required." });
    }

    // Check if the repository already exists in MongoDB
    const existingRepo = await Repository.findOne({ name });
    if (existingRepo) {
        return res.status(400).json({ error: "Repository already exists." });
    }

    // Create a new repository document in MongoDB
    const newRepo = {
        name,
        description: description || "No description provided",
    };

    try {
        // Save the repository metadata in the repositories collection
        const repo = new Repository(newRepo);
        await repo.save();

        // Create the repository folder
        const repoPath = path.join(REPO_DIR, name);
        if (!fs.existsSync(repoPath)) {
            fs.mkdirSync(repoPath, { recursive: true });
        }

        // Create the README file content
        const readmeContent = `# ${name}\n\n${description || "No description provided."}`;
        const readmePath = path.join(repoPath, "README.md");

        // Write the README file to the newly created folder
        fs.writeFileSync(readmePath, readmeContent);

        // Store the README file in MongoDB using GridFS
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "repositories",
        });

        const uploadStream = bucket.openUploadStream("README.md", {
            metadata: { repoId: repo._id, type: "text/markdown" },
        });

        // Pipe the README content to MongoDB
        fs.createReadStream(readmePath).pipe(uploadStream);

        uploadStream.on("finish", () => {
            
            repo.readmeFileId = uploadStream.id;
            repo.save().then(() => {
                res.json({
                    success: true,
                    message: `Repository '${name}' created successfully.`,
                    repository: repo,
                });
            }).catch((err) => {
                res.status(500).json({ error: "Error saving repository after uploading README file." });
            });
        });

        uploadStream.on("error", (err) => {
            console.error("Error uploading README file:", err);
            res.status(500).json({ error: "Error uploading README file." });
        });
    } catch (err) {
        console.error("Error creating repository:", err);
        res.status(500).json({ error: `Error creating repository: ${err.message}` });
    }
});







app.get("/clone/:repoName", (req, res) => {
    const repoName = req.params.repoName;

    // Find the repository metadata in MongoDB
    Repository.findOne({ _id: repoName }).then((repo) => {
        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }

        const name=repo.name;

        const repoPath = path.join(REPO_DIR, name);

        // Zip the repository folder
        const outputZipPath = path.join(os.tmpdir(), `${name}.zip`);
        const outputZip = fs.createWriteStream(outputZipPath);
        const archive = require("archiver")("zip");

        outputZip.on("close", () => {
            res.setHeader("X-Repo-Name", name);
            res.download(outputZipPath, `${name}.zip`, (err) => {
                if (err) {
                    console.error("Error downloading zip file:", err);
                    res.status(500).json({ error: "Error downloading zip file." });
                } else {
                    fs.unlinkSync(outputZipPath); // Clean up the temporary zip file
                }
            });
        });

        archive.pipe(outputZip);
        archive.directory(repoPath, false); // Add the folder content
        archive.finalize();

    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
});


// The '/push' endpoint to handle repository updates including folders and files
app.post("/push", upload2.single("repoFile"), async (req, res) => {
    const { originalname, path: zipFilePath } = req.file;
    const repoName = originalname.replace(".zip", "");

    try {
        // Check if the repository exists in MongoDB
        const repo = await Repository.findOne({ name: repoName });
        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }

        // Temporary directory to extract zip content
        const tempDir = path.join(os.tmpdir(), uuidv4()); // Use a unique temporary folder for extraction
        fs.mkdirSync(tempDir);

        // Extract the zip file contents
        await extractZip(zipFilePath, tempDir);

        // Open GridFS bucket for file uploads
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "repositories",
        });

        // Recursively read all files and directories from the extracted content
        const files = readFilesRecursively(tempDir);

        const fileIds = []; // Keep track of the fileIds to update the repository later

        // Loop over each file and upload it to GridFS
        for (const file of files) {
            const filePath = path.join(tempDir, file.path);
            if (fs.lstatSync(filePath).isFile()) {
                // Create an upload stream for each file
                const uploadStream = bucket.openUploadStream(file.path, {
                    metadata: { repoId: repo._id, path: file.path },
                });

                // Pipe the file content into GridFS
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(uploadStream)
                    .on("error", (err) => {
                        console.error("❌ Push error:", err);
                        res.status(500).json({ error: `Could not push file: ${err.message}` });
                    })
                    .on("finish", async () => {
                        // Add the uploaded file's ID to the list
                        fileIds.push(uploadStream.id);

                        // Check if all files are uploaded, then update the repository
                        if (fileIds.length === files.length) {
                            

                            
                            repo.fileIds = fileIds; 
                            await repo.save(); 

                            
                            rimraf.sync(tempDir); 

                            
                            res.json({ success: true, message: `Repository '${repoName}' updated successfully`, fileIds });
                        }
                    });
            }
        }
    } catch (err) {
        console.error("❌ Push error:", err);
        res.status(500).json({ error: `Error pushing to repository: ${err.message}` });
    } finally {
        fs.unlinkSync(zipFilePath); 
    }
});


const readFilesRecursively = (dirPath, basePath = '') => {
    const files = fs.readdirSync(dirPath);
    const fileList = [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.join(basePath, file);

        if (fs.lstatSync(fullPath).isDirectory()) {
            fileList.push(...readFilesRecursively(fullPath, relativePath));
        } else {
            fileList.push({ path: relativePath });
        }
    });

    return fileList;
};


const extractZip = (zipPath, dest) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: dest }))
            .on("close", resolve)
            .on("error", reject);
    });
};




app.post("/repositories/:repoName/file", express.json(), (req, res) => {
    const { filePath, fileName, content } = req.body;
    const repoName = req.params.repoName;
  

  
    const fullPath = path.join(REPO_DIR, repoName, filePath, fileName);

    console.log(fullPath);
  
    try {
      fs.writeFileSync(fullPath, content, "utf-8");
      res.status(200).json({ message: "File updated successfully" });
    } catch (err) {
      console.error("Failed to write file:", err);
      res.status(500).json({ error: "Failed to write file" });
    }
  });

app.get("/repositories/:repoId/comments", async (req, res) => {
    const { repoId } = req.params;

    try {
        const comments = await Comment.find({ repoId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        console.error("Failed to fetch comments:", err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});



app.post("/repositories/:repoId/comments", async (req, res) => {
    const { repoId } = req.params;
    const { author, content, rating} = req.body;

    if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    try {
        // Ensure the repo exists
        const repo = await Repository.findById(repoId);
        if (!repo) {
            return res.status(404).json({ error: "Repository not found" });
        }

        const newComment = new Comment({ repoId, author, content, rating});
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        console.error("Failed to post comment:", err);
        res.status(500).json({ error: "Failed to post comment" });
    }
});





app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
