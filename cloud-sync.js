// cloud-sync.js
class GoogleDriveSync {
    constructor(config) {
        this.config = config;
        this.isSignedIn = false;
        this.gapiReady = false;
    }

    async init() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.config.apiKey,
                        clientId: this.config.clientId,
                        discoveryDocs: this.config.discoveryDocs,
                        scope: this.config.scope
                    });
                    
                    this.gapiReady = true;
                    this.isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
                    resolve(this.isSignedIn);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async signIn() {
        try {
            await gapi.auth2.getAuthInstance().signIn();
            this.isSignedIn = true;
            return true;
        } catch (error) {
            console.error('Sign in error:', error);
            return false;
        }
    }

    async signOut() {
        await gapi.auth2.getAuthInstance().signOut();
        this.isSignedIn = false;
    }

    async uploadData(data) {
        if (!this.isSignedIn) {
            throw new Error('Not signed in');
        }

        const fileName = 'moneytrack-data.json';
        const content = JSON.stringify(data, null, 2);
        const file = new Blob([content], { type: 'application/json' });

        const metadata = {
            name: fileName,
            mimeType: 'application/json'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + gapi.auth.getToken().access_token }),
            body: form
        });

        return await response.json();
    }

    async downloadData() {
        if (!this.isSignedIn) {
            throw new Error('Not signed in');
        }

        // Search for the file
        const response = await gapi.client.drive.files.list({
            q: "name='moneytrack-data.json'",
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        const files = response.result.files;
        if (files && files.length > 0) {
            const fileId = files[0].id;
            const file = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            return file.result;
        }

        return null;
    }
}

// Initialize
const driveSync = new GoogleDriveSync(GOOGLE_CONFIG);