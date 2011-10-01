// Dependecies
var glob = require('glob'),
	fs = require('fs'),
	path = require('path');

var Installer = function () {
	this.files = [];
	this.currentFile = null;

	this.findFiles( this.processFiles );
};

Installer.BASE_PATH = path.join( process.env.HOME, '/Development/dotfiles-test');

Installer.prototype.findFiles = function (cb) {
	var self = this;

	glob('*/*.symlink', function (err, matches) {
		self.files = matches;

		cb.call( self );
	});
};

Installer.prototype.processFiles = function () {
	if (!this.files.length) {
		throw new Error('No files to process');
	}

	this.handleFile( this.files.pop(), function () {

	});
};

Installer.prototype.handleFile = function (file) {
	file = file.replace(/^(.+[^\/])\/?/, '$1');

	this.currentFile = new File( file ); 
};

Installer.prototype.File = function (file) {
	this.fileName = file.split('/').slice(-1)[0].split('.symlink')[0];
	this.filePath = path.join( process.cwd(), file );
	this.targetFile = path.join(Installer.BASE_PATH, '/', fileName);
};

File.prototype.overwrite = function () {};
File.prototype.backup = function () {};
File.prototype.symlink = function () {
	if (path.existsSync( this.targetFile ) {
		
	} else {
	}
};

new Installer;
