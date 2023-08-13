const pkg = require("./package.json");
const library = require("./src/index.js");
const path = require("path");
const fs = require("fs");

// Based on

// https://github.com/molly/static-timeline-generator
// https://github.com/molly/web3-is-going-great

const pluginDefaults = {
	domainName: "http://localhost:8080",
	timelineOutFolder: "timelines",
	outDir: path.normalize(path.join(__dirname, "../../../", "docs")),
	// escape from the layout folder
	layoutFolderDepth: "../../",
	timelinesInFolder: "/src/timelines/",
	customCSS: "assets/css/template-timeline.css",
	addBaseFiles: false, // true will take the execution path and add eleventyConfig.dir.input returned to the eleventyConfig directory. A string will target that exact path.
};

module.exports = function (eleventyConfig, options) {
	const pluginConfig = Object.assign(pluginDefaults, options);
	pluginConfig.jsPath = pluginConfig.domainName + "/assets/timelines/js";
	pluginConfig.cssPath = pluginConfig.domainName + "/assets/timelines/css";
	const dirs = __dirname.split(process.cwd());
	const pluginLayoutPath = path.join(
		pluginConfig.layoutFolderDepth,
		//"./",
		dirs[1],
		"src",
		"layouts"
	);
	console.log(
		"Activate Timelinety",
		pluginConfig,
		path.join(__dirname, "/src/js"),
		process.cwd(),
		dirs,
		pluginLayoutPath
		// fs.statSync(path.join(pluginLayoutPath, "timeline-item.njk"))
	);
	eleventyConfig.addTemplateFormats("njk,md");
	console.log(
		"eleventyConfig dir",
		eleventyConfig.dir,
		path.normalize(path.join(process.cwd(), eleventyConfig.dir.input)),
		path.normalize(path.join(__dirname, "pages"))
	);
	if (pluginConfig.addBaseFiles) {
		eleventyConfig.on("eleventy.before", () => {
			let copyFileTo = path.normalize(path.join(process.cwd(), "src"));
			if (typeof pluginConfig.addBaseFiles == "string") {
				copyFileTo = pluginConfig.addBaseFiles;
			} else {
				copyFileTo = path.normalize(
					path.join(process.cwd(), eleventyConfig.dir.input)
				);
			}
			const copyFromPath = path.normalize(
				path.join(__dirname, "src/pages")
			);
			[
				"timeline.md",
				"timelines.md",
				"timeline-endpoints.md",
				"timeline-pages.md",
			].forEach((file) => {
				const timelineMDFile = path.join(copyFromPath, file);
				const targetMDFile = path.join(copyFileTo, file);

				if (!fs.existsSync(targetMDFile)) {
					console.log(
						`Eleventy copy from ${timelineMDFile} to ${targetMDFile}`
					);
					console.log("File does not already exist, copy it over");
					fs.copyFileSync(
						timelineMDFile,
						targetMDFile,
						fs.constants.COPYFILE_EXCL
					);
				}
			});
		});
	}
	pluginConfig.pluginLayoutPath = pluginLayoutPath;
	const localJs = path.join(__dirname, "/src/js");
	const jsPassthru = {};
	jsPassthru[localJs] = "assets/timelines/js";
	eleventyConfig.addPassthroughCopy(jsPassthru);
	const localCss = path.join(__dirname, "/src/css");
	const cssPassthru = {};
	cssPassthru[localCss] = "assets/timelines/css";
	eleventyConfig.addPassthroughCopy(cssPassthru);
	eleventyConfig.addLayoutAlias(
		"timeline",
		path.join(pluginLayoutPath, "timeline.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-standalone-item",
		path.join(pluginLayoutPath, "timeline-standalone-item.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-base",
		path.join(pluginLayoutPath, "timeline-base.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-head",
		path.join(pluginLayoutPath, "head.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-json",
		path.join(pluginLayoutPath, "json/timeline.njk")
	);
	eleventyConfig.addLayoutAlias(
		"timeline-wrapper",
		path.join(pluginLayoutPath, "timeline-wrapper.njk")
	);
	eleventyConfig.addGlobalData("timelinesConfig", pluginConfig);
	eleventyConfig.addFilter("makeISODate", function (value) {
		return new Date(value).toISOString();
	});
	return library(eleventyConfig, pluginConfig);
};

// Notes - Load other posts above and below
