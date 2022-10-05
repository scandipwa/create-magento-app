/* eslint-disable no-bitwise */
/* eslint-disable max-len */
class NginxParser {
    constructor(format) {
        this.directives = {};

        const prefix = format.match(/^[^$]*/);
        if (prefix) {
            format = this.escape(prefix[0]) + format.slice(prefix[0].length);
        }

        this.parser = format;

        const directive = /\$([a-z_]+)(.)?([^$]+)?/g;
        let match;
        let regex;
        let boundary;
        let i = 1;

        // eslint-disable-next-line no-cond-assign
        while ((match = directive.exec(format))) {
            this.directives[match[1]] = i++;
            if (match[2]) {
                boundary = this.escape(match[2]);
                regex = `([^${ boundary }]*?)${ boundary}`;
                if (match[3]) {
                    regex += this.escape(match[3]);
                }
            } else {
                regex = '(.+)$';
            }
            this.parser = this.parser.replace(match[0], regex);
        }

        this.parser = new RegExp(this.parser);
    }

    /**
     * Parse a log line.
     *
     * @param {String} line
     * @returns {Record<'msec' | 'time_iso8601' | 'remote_addr' | 'query_string' | 'http_x_forwarded_for' | 'http_user_agent' | 'http_referer' | 'time_local' | 'request' | 'status' | 'request_time' | 'request_length' | 'pipe' | 'connection' | 'bytes_sent' | 'body_bytes_sent' | 'date' | 'timestamp' | 'ip' | 'ip_str', string>}
     */
    parseLine(line) {
        const match = line.match(this.parser);
        if (!match) {
            return;
        }

        const row = {
            msec: null,
            time_iso8601: null,
            remote_addr: null,
            query_string: null,
            http_x_forwarded_for: null,
            http_user_agent: null,
            http_referer: null,
            time_local: null,
            request: null,
            status: null,
            request_time: null,
            request_length: null,
            pipe: null,
            connection: null,
            bytes_sent: null,
            body_bytes_sent: null,

            date: null,
            timestamp: null,
            ip: null,
            ip_str: null
        };

        // eslint-disable-next-line guard-for-in
        for (const key in this.directives) {
            row[key] = match[this.directives[key]];
            if (row[key] === '-') {
                row[key] = null;
            }
        }

        // Parse the timestamp
        if (row.time_iso8601) {
            row.date = new Date(row.time_iso8601);
        } else if (row.msec) {
            row.date = new Date(Number(row.msec.replace('.', '')));
        }
        if (row.date) {
            row.timestamp = row.date.getTime();
        }

        // Parse the user's IP
        if (row.http_x_forwarded_for) {
            row.ip_str = row.http_x_forwarded_for;
        } else if (row.remote_addr) {
            row.ip_str = row.remote_addr;
        }
        if (row.ip_str) {
            const ip = row.ip_str.split('.', 4);
            row.ip = Number(ip[0]) * (2 << 23)
                + Number(ip[1]) * (2 << 15)
                + Number(ip[2]) * (2 << 7)
                + Number(ip[3]);
        }

        return row;
    }

    /**
     * Escape regular expression tokens.
     *
     * @param {String} str
     * @return {String}
     */
    escape(str) {
        return str.replace(new RegExp('[.*+?|()\\[\\]{}]', 'g'), '\\$&');
    }
}

module.exports = {
    NginxParser
};
