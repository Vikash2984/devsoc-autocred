# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    && apt-get clean

# Copy the application files to the container
COPY . /app

# Install required Python packages from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose the FastAPI application port
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
