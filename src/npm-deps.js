var spawn = require('cordova-common').superspawn.spawn,
    temp = require("temp"),
    rimraf = require("rimraf");

module.exports = async function () {
    try {
        var packageSpec = "cordova";

        console.log("Creating temporary directory...");
        var tempDir = await makeTempDir("npm-deps-");
        console.log(`Temporary directory is "${tempDir}"`);
        console.log(`Installing ${packageSpec} under temporary directory (will take a while)...`);
        var result = await spawn("npm.cmd", ["install", packageSpec, "--json"], {cwd:tempDir});
        console.log("...Done. Deleting temporary directory...");
        removeFolder(tempDir);
        console.log("...Done. Processing results...");
        processDependencies(JSON.parse(result));
        console.log(`...Done. Found ${allDependencies.length} dependencies:`);
        allDependencies.sort(function (a, b) {
            if (a.toUpperCase() < b.toUpperCase()) {
                return -1;
            }
            return 1;
        });
        console.log(allDependencies.join("\n"));
    } catch (e) {
        console.log(e);
    }
};

var allDependencies = [];
function processDependencies(info) {
    var dependencies = info.dependencies;
    if (!dependencies) {
        return;
    }

    Object.getOwnPropertyNames(dependencies).forEach(function (packageName) {
        var packageInfo = dependencies[packageName];
        var packageVersion = packageInfo.version;
        var packageSpec = `${packageName}@${packageVersion}`;
        if (allDependencies.indexOf(packageSpec) == -1) {
            allDependencies.push(packageSpec);
            processDependencies(packageInfo);
        }
    });
}

function makeTempDir(affixes) {
    return new Promise(function (resolve, reject) {
        temp.mkdir(affixes, function (err, dirPath) {
            if (err) {
                reject(err);
            } else {
                resolve(dirPath);
            }
        })
    });
}

function removeFolder(dir) {
    return new Promise(function (resolve, reject) {
        rimraf(dir, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}
