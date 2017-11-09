module.exports = {
    dirs: {
        dist: "./dist/",
        css: "./dist/css",
        js: "./dist/js",
        images: "./dist/images"
    },
    path: {
        dist: "./dist",
        src: "./src",
        deploy: "./deploy"
    },
    sftp: {
        host: "",
        user: "",
        port: "",
        key: "",
        pass: "",
        remotePath: ""
    },
    proxy: {
        host: "",
        port: "",
        path: "",
        header: function(config) {
            return {

            };
        }
    }
};