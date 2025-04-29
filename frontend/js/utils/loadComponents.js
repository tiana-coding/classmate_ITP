export async function loadComponents(components) {
    try {
        for (const { id, component } of components) {
            const response = await fetch(`../components/${component}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load ${component} component (${response.status})`);
            }
            const html = await response.text();
            
            const element = document.getElementById(id);
            if (!element) {
                throw new Error(`Element with id '${id}' not found`);
            }

            if (component === 'header') {
                element.innerHTML = html;
            } else {
                element.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error in loadComponents:', error);
        throw error;
    }
}