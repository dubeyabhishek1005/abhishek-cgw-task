import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

export default class ShowInvoiceJson extends LightningElement {
    jsonData;

    @wire(CurrentPageReference)
    getPageReference(currentPageReference) {
        if (currentPageReference && currentPageReference.state) {
            this.jsonData = decodeURIComponent(currentPageReference.state.c__jsonData);
        }
    }
}
