import requests
import zipfile
import os
import sys

def clone_repo(repo_name):
    url = f"http://localhost:5000/clone/{repo_name}"
    

    print(f"📥 Cloning {repo_name}...")

    # Download the file
    response = requests.get(url)
    
    # Check if the response is OK (status code 200)
    if response.status_code == 200:
        actual_repo_name = response.headers.get("X-Repo-Name", "unknown_repo")

        zip_path = f"{actual_repo_name}.zip"

        with open(zip_path, "wb") as f:
            f.write(response.content)
        print(f"✅ Downloaded {zip_path}, extracting...")

        # Check if it's a valid zip file
        try:
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(actual_repo_name)
            print(f"✅ Extracted {actual_repo_name}!")
        except zipfile.BadZipFile:
            print(f"❌ The file {zip_path} is not a valid ZIP file.")
    else:
        print(f"❌ Failed to download the repository. Status Code: {response.status_code}")


