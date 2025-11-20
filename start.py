import uvicorn
import os
import sys

if __name__ == "__main__":
    # Get the absolute path to the project root and the backend directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")

    # Add the backend directory to the Python path to help with module discovery
    sys.path.insert(0, backend_dir)

    # Change the current working directory to the backend directory for relative paths
    os.chdir(backend_dir)
    
    print("Added to sys.path:", backend_dir)
    print("Changed working directory to:", os.getcwd())
    print("Starting Uvicorn server, loading app from 'main:app'")
    
    # Now that we are in the 'backend' directory and it's in the path,
    # uvicorn should reliably find 'main:app'.
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=True
    )
