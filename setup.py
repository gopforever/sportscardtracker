"""Setup script for Sports Card Tracker."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="sportscardtracker",
    version="1.0.0",
    author="Sports Card Tracker",
    description="A comprehensive sports card price tracking and inventory management tool",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/gopforever/sportscardtracker",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Office/Business :: Financial",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=[
        "requests>=2.31.0",
        "pyyaml>=6.0",
        "pandas>=2.0.0",
        "click>=8.1.0",
        "python-dateutil>=2.8.0",
        "tabulate>=0.9.0",
    ],
    entry_points={
        "console_scripts": [
            "sportscards=src.cli:cli",
        ],
    },
)
