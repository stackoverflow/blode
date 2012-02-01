# Blode

A simple static site/blog generator like jekyll but simpler, made in node.js

## Install

> $npm install blode -g

## Structure

    .
    |-- config.json
    |-- static
    |-- layouts
    |   |-- main.html
    |-- pages
    |   |-- no-layout-page.md
    |   |   main
    |   |   |-- page-using-main-layout.md
    |-- output

### config.json

Main site configuration.

### static

All static files like html, images, documents, etc. They'll be copied to the output folder.

### layouts

Layout files represented as [doT](http://olado.github.com/doT/) html files (allowed extensions: .htm, .html).
Somewhere in your layout you must define a variable called blode.body.
<br/>
E.g:

    <body>
    -- header --
    {{=blode.body}}
    -- footer --
    </body>
All files should be utf-8 encoded.

### pages

The dynamic content. They should be markdown files (extension .md).
If you put a page inside a subfolder called X then X is the name of the layout (without extension) to use for this page.
All files should be utf-8 encoded.

### output

The folder where the generated content will be placed.

## Usage

You can use `-v` or `--verbose` to execute the commands in verbose mode.

> blode -h

Show the help.

> blode -n /my/new/site

Creates a new site skeleton at `/my/new/site` or at the current working dir if none is specified.

> blode -g

Generates the site at current dir (must be a valid blode directory).

> blode -s 3000

Starts a web server at port 3000 (default: 4000) to test the site (must be a valid blode directory).