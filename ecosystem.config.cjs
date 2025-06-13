const env = {
}

module.exports = {
    setEnv(name, value) {
        env[name] = value;
    },
    apps: [
        {
            cwd: __dirname,
            name: "rtmp",
            script: `${__dirname}/rtmp-server/nginx/sbin/nginx`,
            args: `-c ${__dirname}/rtmp-server/nginx/conf/nginx.conf`,
            exp_backoff_restart_delay: 100,
            env,
            out_file: `${__dirname}/rtmp-server/nginx/logs/nginx.log`,
            error_file: `${__dirname}/rtmp-server/nginx/logs/nginx.log`,
            merge_logs: true,
            watch: false,
        },
        {
            cwd: __dirname,
            name: "cast",
            script: "npm",
            // args: "upload/index.js",
            args: "start",
            exp_backoff_restart_delay: 100,
            env
        },
    ],
};
