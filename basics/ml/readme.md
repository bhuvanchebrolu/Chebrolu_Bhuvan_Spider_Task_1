# Vehicle Image Classification using ResNet18

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-1.9%2B-orange)
![License](https://img.shields.io/badge/License-MIT-green)

A deep learning project that classifies vehicle images into 7 categories using PyTorch and transfer learning with ResNet18.

## Dataset
The dataset contains images across 7 classes:
- Auto Rickshaws
- Bikes
- Cars
- Motorcycles
- Planes
- Ships
- Trains

**Source:** [Kaggle Vehicle Classification Dataset](https://www.kaggle.com/datasets/mohamedmaher5/vehicle-classification)


Data Preparation:
The dataset is loaded using ImageFolder and split into training (80%) and test (20%) sets.
Images are resized to 256x256, center-cropped to 224x224, and normalized.

Model Architecture:
Uses pre-trained ResNet18 with frozen weights except for the final layer.
The final fully connected layer is replaced to output 7 classes.

Training:
Uses Adam optimizer with CrossEntropyLoss.
Implements learning rate scheduling.
Tracks both training and test accuracy/loss during training.

Evaluation:
Calculates final test accuracy.
Visualizes predictions for one image from each class with true and predicted labels.

GPU Acceleration:
The code automatically detects and uses GPU if available.
