# Munchers

## Project Overview
Welcome to the Munchers project repository. This project consists of a modern web application separated into a frontend and a backend.

## Folder Structure
This project is divided into two main directories:
- `frontend/`: Contains all frontend code and dependencies.
- `backend/`: Contains all backend code and dependencies.

## Branch Workflow
We are working in parallel using a single company GitHub account. To prevent conflicts, we strictly adhere to the following branch workflow:
- **`main`**: The production-ready integration branch. **Do not work directly on or commit to the `main` branch.**
- **`frontend`**: The active development branch for all frontend work.
- **`backend`**: The active development branch for all backend work.

### Contribution Guidelines
1. **Frontend Developer**: Only work within the `frontend/` folder and only commit to the `frontend` branch.
2. **Backend Developer**: Only work within the `backend/` folder and only commit to the `backend` branch.
3. **Merging**: When a feature or milestone is complete, open a Pull Request (PR) from your development branch (`frontend` or `backend`) into the `main` branch. 

## Developer Documentation

### 1. Clone the Project
```bash
git clone https://github.com/devnNexOfficial/Munchers.git
cd Munchers
```

### 2. Switch to Your Branch
After cloning, check out the branch specific to your role:

**Frontend Developer:**
```bash
git checkout frontend
```

**Backend Developer:**
```bash
git checkout backend
```

### 3. Update from Main
Keep your branch up to date with the `main` branch to avoid merge conflicts:
```bash
git fetch origin
git merge origin/main
```

### 4. Commit and Push Changes
When you have made changes in your designated folder, commit and push them to your specific branch:
```bash
git add .
git commit -m "Describe your changes clearly"
git push origin <your-branch-name>
```
*(Replace `<your-branch-name>` with `frontend` or `backend`)*
