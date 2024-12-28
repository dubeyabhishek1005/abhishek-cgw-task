import { LightningElement, track } from 'lwc';

export default class CreateInvoice extends LightningElement {
    @track params = [];
    connectedCallback() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.params = [...urlParams.entries()].map(([key, value]) => ({ name: key, value }));
    }
}