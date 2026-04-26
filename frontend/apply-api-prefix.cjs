const fs = require('fs');
const path = require('path');

const traverseDir = (dir, callback) => {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
};

const srcDir = 'c:/Users/srika/Desktop/educonnect/frontend/src';

traverseDir(srcDir, (fullPath) => {
    if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;

        // 1. App.jsx: Comment out or remove axios.defaults.baseURL
        if (fullPath.endsWith('App.jsx')) {
            content = content.replace("axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';", "// axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';");
        }

        // 2. Replace axios.get('/path') with axios.get(import.meta.env.VITE_API_BASE_URL + '/path')
        // Excluding lines that already have it
        content = content.replace(/axios\.(get|post|put|delete)\('(?!\$\{import\.meta\.env\.VITE_API_BASE_URL)(?!\/api\/)([^']+)'/g, (match, method, path) => {
            if (path.startsWith(process.env.VITE_API_BASE_URL || 'NONE_MATCH')) return match; 
            return `axios.${method}(import.meta.env.VITE_API_BASE_URL + '${path}'`;
        });

        // 3. Replace axios.get(`/path/${id}`) with axios.get(`${import.meta.env.VITE_API_BASE_URL}/path/${id}`)
        content = content.replace(/axios\.(get|post|put|delete)\(`(?!\$\{import\.meta\.env\.VITE_API_BASE_URL)(?!\$\{import\.meta\.env\.VITE_API_URL)([^`]+)`/g, (match, method, path) => {
             return `axios.${method}(\`\${import.meta.env.VITE_API_BASE_URL}${path}\``;
        });

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log('Updated:', fullPath);
        }
    }
});
