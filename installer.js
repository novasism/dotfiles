// Dependecies
var glob = require('glob'),
fs       = require('fs'),
path     = require('path'),
util     = require('util'),
events   = require('events')
readline = require('readline');

var _File;

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
	var self = this;

	if (!this.files.length) {
		throw new Error('No files to process');
	}

	// Use next file in stack
	this.handleFile( this.files.pop(), function nextFile () {
		self.files.length && self.handleFile( self.files.pop(), nextFile );
	});
};

Installer.prototype.handleFile = function (file, cb) {
	file = file.replace(/^(.+[^\/])\/?/, '$1');

	this.currentFile = new this.File( file, cb );
	this.currentFile.on('file exists', function (data) {
		var i = readline.createInterface(process.stdin, process.stdout, null);

		i.question('File ' + data.fileName + ' already exists, what do you want to do?\n', function (answer) {
			var close = true;

			switch (answer) {
				case 'o':
				case 'overwrite':
					console.log('overwrite');
					break;

				case 'b':
				case 'backup':
					console.log('backup');
					break;

				default:
					// @TODO: Reask
					console.log('I don\'t understand');
					close = false;

					break;
			}

			if (close) {
				i.close();
				process.stdin.destroy();
			}
		});
	});

	this.currentFile.symlink();
};

Installer.prototype.File = function (file, cb) {
	this.callback = cb;

	this.fileName = file.split('/').slice(-1)[0].split('.symlink')[0];
	this.filePath = path.join( process.cwd(), file );
	this.targetFile = path.join(Installer.BASE_PATH, '/', file);
};
_File = Installer.prototype.File;
util.inherits( _File, events.EventEmitter );

_File.prototype.overwrite = function () {};
_File.prototype.backup = function () {};
_File.prototype.symlink = function () {
	this.emit('file exists', this);
	if (path.existsSync( this.targetFile )) {
		
	} else {
	}
};

new Installer;
