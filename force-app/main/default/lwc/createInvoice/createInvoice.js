import { LightningElement, track } from 'lwc';
import fetchLineItems from '@salesforce/apex/InvoiceHandler.fetchLineItems';
import insertInvoice from '@salesforce/apex/InvoiceHandler.insertInvoice';

export default class CreateInvoice extends LightningElement {
    @track lineItems = [];
    @track rcrdId = 0;
    connectedCallback() {
        this.getPageParameters();
    }

    getPageParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const originRecord = urlParams.get('c__origin_record') || '';

        if (originRecord) {
            this.fetchLineItemData(originRecord);
            this.insertInvoices(originRecord);
        }
    }

    fetchLineItemData(recordId) {
        this.rcrdId = recordId;
        const futureDate = new Date();
        futureDate.setDate(new Date().getDate() + 30);
        const formattedFutureDate = futureDate.toISOString().split('T')[0];

        fetchLineItems({ parentId: recordId })
            .then((data) => {
                this.lineItems = data.map((item) => ({
                    id: item.Id,
                    quantity: item.Quantity,
                    unitPrice: item.UnitPrice,
                    accountId: item.Opportunity.AccountId,
                    invoice_due_date: formattedFutureDate,
                    child_relationship_name: 'OpportunityLineItem',
                    line_item_description: item.Description,
                    invoice_date: item.Opportunity.CloseDate
                }));

                this.updateURLParams();
                //this.insertInvoices();
            })
            .catch((error) => {
                console.error('Error fetching line items:', error);
            });
    }

    updateURLParams() {
        const urlParams = new URLSearchParams(window.location.search);

        Array.from(urlParams.keys()).forEach((key) => {
            if (key.startsWith('c__line_item_')) {
                urlParams.delete(key);
            }
        });

        this.lineItems.forEach((item, index) => {
            urlParams.set(`c__line_item_description${index}`, item.line_item_description || '');
            urlParams.set(`c__line_item_quantity${index}`, item.quantity);
            urlParams.set(`c__line_item_unit_price${index}`, item.unitPrice);
        });

        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
        console.log('Updated URL:', newUrl);
    }

    /*insertInvoices() {
        if (this.lineItems.length > 0) {
            insertInvoice({ lstOpportunityLineItem: this.lineItems })
                .then((message) => {
                    console.log('Insert Invoices Success:', JSON.stringify(this.lineItems));
                })
                .catch((error) => {
                    console.error('Error inserting invoices:', error);
                });
        } else {
            console.warn('No line items available to create invoices.');
        }
    }*/

    insertInvoices(recordId) {
        insertInvoice({ parentId: recordId })
            .then((message) => {
            console.log('Insert Invoices Success:', message);
        })
        .catch((error) => {
            console.error('Error inserting invoices:', error);
        });
    }
}