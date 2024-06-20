# Gene samples

This directory contains a script to convert the gene sample PDF names to a hash of the person id. This is done so that the players can't guess the gene sample file names.

1. Download the gene sample PDFs from Google Drive and place them in this directory
2. Make sure that files.csv is up to date, as it maps the file names to person id's
3. Make sure you are in this directory and run `./convert.sh`
4. The script will create a new directory called `processed` that contains the PDFs where the file name is now the first 8 characters of the sha1 hash of the person id
5. The contents of `processed` can be uploaded to the server to be served under `/gene-samples/`
