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

Main site configuration.<br/>
The possible keys are:

-   port (number): the default server port (--server).
-   url (string): the site's url.
-   rss (object): if you specify this object in the config an RSS will be created
    everytime you regenerate the site (--gen). The object format:
    
        {
            "title": "a title",
            "description": "a description",
            "feed_url": "http://example.com/rss.xml",
            "site_url": "http://example.com",
            "image_url": "http://example.com/icon.png",
            "author": "Test Jones"
        }

### static

All static files like html, images, documents, etc. They'll be copied to the output folder.

### layouts

Layout files represented as [doT](http://olado.github.com/doT/) html files (allowed extensions: .htm, .html).
You can use the following variables inside a layout:

- blode.body: this is the main content of the layout
- blode.posts: an array of all you site's posts. Each one is an object in the form {"path": "/full/path", "link": "post-name.html", "name": "post-name"}
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

> blode --help

Show the help.

> blode --new /my/new/site

Creates a new site skeleton at `/my/new/site` or at the current working dir if none is specified.

> blode --gen

Generates the site at current dir (must be a valid blode directory).

> blode --server 3000

Starts a web server at port 3000 (default: 4000) to test the site (must be a valid blode directory).