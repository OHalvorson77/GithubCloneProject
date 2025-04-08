import argparse
from utils.push_repo import push_repo
from utils.clone_repo import clone_repo

def main():
    parser = argparse.ArgumentParser(prog="owen", description="OwenHub CLI")
    subparsers = parser.add_subparsers(dest="command")

    # Push command
    push_parser = subparsers.add_parser("push", help="Push local repo to remote")
    push_parser.add_argument("repo_folder", help="Path to your local repo folder")

    # Clone command
    clone_parser = subparsers.add_parser("clone", help="Clone repo from remote")
    clone_parser.add_argument("repo_name", help="Name of the repo to clone")

    args = parser.parse_args()

    if args.command == "push":
        push_repo(args.repo_folder)
    elif args.command == "clone":
        clone_repo(args.repo_name)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
