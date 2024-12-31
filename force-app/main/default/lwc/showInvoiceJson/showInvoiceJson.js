import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import createInvoiceandInvoiceLineItems from '@salesforce/apex/InvoiceCreateController.createInvoiceandInvoiceLineItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
export default class ShowInvoiceJson extends LightningElement {
    jsonData;

    @wire(CurrentPageReference)
    getPageReference(currentPageReference) {
        if (currentPageReference && currentPageReference.state) {
            this.jsonData = decodeURIComponent(currentPageReference.state.c__jsonData);
        }
    }
    createInvoiceData(data) {
        const lineItems = data.lineItems.map(item => ({
            description: item.Name,
            quantity: item.Quantity,
            unit_price: item.UnitPrice,
            amount: item.Quantity * item.UnitPrice,
        }));

        const invoiceData = {
            account_id: data.account, 
            opportunityId: data.Id,
            reference: data.referenced,
            contact_id: '0000000', 
            date: data.invoiceDate,
            due_date: data.dueDate,
            total: lineItems.reduce((sum, item) => sum + item.amount, 0),
            line_items: lineItems,
        };

        return invoiceData;
    }

    handleCreateInvoice() {
        if (this.jsonData) {
            if (!this.jsonData) {
                this.showToast('Error', 'No JSON data available for processing.', 'error');
                return;
            }
            createInvoiceandInvoiceLineItems({ jsonData: this.jsonData })
                .then(() => {
                    this.showToast('Success', 'Invoice and Line Items created successfully!', 'success');
                })
                .catch((error) => {
                    this.showToast('Error', error.body.message, 'Null hkya');
                });
        } else {
            this.showToast('Error', 'JSON data is not available.', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
