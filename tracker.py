#!/usr/bin/env python3
"""
Sports Card Tracker - Entry Point

Main entry point for the sports card tracker CLI.
"""

import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / 'src'
sys.path.insert(0, str(src_path))

from cli import cli

if __name__ == '__main__':
    cli(obj={})
