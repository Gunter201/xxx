FROM python:3.9-slim

# Set the working directory 
WORKDIR /usr/src/app

# Install  packages
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Copy the current directory contents 
COPY . .

# Install packages in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 
EXPOSE 8000

# Define environment variable
ENV NAME ImageSearchEngine

# Run server.py
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "80"]



