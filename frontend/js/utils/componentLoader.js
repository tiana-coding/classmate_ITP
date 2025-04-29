export async function initializeComponents(components) {
    try {
        for (const component of components) {
            const response = await fetch(`../components/${component}.html`);
            if (!response.ok) throw new Error(`Failed to load ${component}`);
            const html = await response.text();
            
            const placeholder = document.getElementById(`${component}-component`);
            if (placeholder) {
                placeholder.innerHTML = html;
                
                // Initialize component if// filepath: /Users/yuetingliu/Desktop/itp/classmate_ITP/itp/frontend/js/utils/componentLoader.js
export async function initializeComponents(components) {
    try {
        for (const component of components) {
            const response = await fetch(`../components/${component}.html`);
            if (!response.ok) throw new Error(`Failed to load ${component}`);
            const html = await response.text();
            
            const placeholder = document.getElementById(`${component}-component`);
            if (placeholder) {
                placeholder.innerHTML = html;
                
                // Initialize component if