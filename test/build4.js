const COMMON_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/common';
const CO_FILE_PATH = '/Users/imadhushanka/Documents/Build-Tool/custom-objects';
const RESERVED_IDENTIFIERS = ['console','log','return','require','prototype','slice','Facade'];
const DESTINATION = '/Users/imadhushanka/Documents/Build-Tool/custom-objects/$object1/includes/';

const esprima = require('esprima');
const fs = require('fs-extra');
const _ = require('lodash');
const rimraf = require('rimraf');
const path = require('path');

rimraf.sync(path.join(COMMON_FILE_PATH,'auth','sign'));