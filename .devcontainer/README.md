# Development container

## Python packages

This container uses Python 3.13 with UV for package management. The image omits
the unused pip package and the complete ensurepip bootstrap (including its bundled
pip wheel), so a vulnerable vendored dependency is not retained in the image.
The operating system's Python is unchanged.

Use `uv venv --python 3.13` and `uv pip install --python .venv/bin/python PACKAGE`
for Python dependencies. Standard-library virtual environments remain available
with `python -m venv --without-pip .venv`. `python -m pip`, `python -m ensurepip`,
and automatic pip seeding by `python -m venv` are deliberately unavailable.

This is a documented departure from the downstream distributor recommendations
in [PEP 453](https://peps.python.org/pep-0453/#recommendations-for-downstream-distributors),
for this UV-managed development image. Reinstalling managed Python can restore
the upstream packaging tools; reassess their dependencies before doing so.
