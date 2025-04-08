import requests
import zipfile
import os
import shutil
from utils.logger import get_logger
from colorama import Fore

logger = get_logger()

def zip_folder(folder_path, zip_path):
    shutil.make_archive(zip_path.replace(".zip", ""), 'zip', folder_path)

def push_repo(repo_name):
    logger.info(f"Pushing repo: {repo_name}")
    print(Fore.CYAN + f"📦 Pushing {repo_name}...")
    folder_path = os.path.abspath(repo_name)
    if not os.path.exists(folder_path):
        print(f"❌ Folder '{repo_name}' not found.")
        return

    zip_path = f"{repo_name}.zip"
    zip_folder(folder_path, zip_path)

    with open(zip_path, "rb") as f:
        files = {"repoFile": (zip_path, f, "application/zip")}
        
        response = requests.post("http://localhost:5000/push", files=files)

    os.remove(zip_path)

    if response.ok:
        print(Fore.GREEN + "✅ Push completed.")
        logger.info("Push successful.")
    else:
        print(Fore.RED + "❌ Push failed.")
        logger.error(f"Push failed: {e}")
