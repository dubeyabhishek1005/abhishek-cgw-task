public class InvoiceHandler {
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> fetchLineItems(Id parentId) {
        // Query OpportunityLineItems
        return [
            SELECT Id, Description, Quantity, UnitPrice, 
                   Opportunity.AccountId, Opportunity.Invoice_Due_Date__c,
                   Opportunity.CloseDate
            FROM OpportunityLineItem
            WHERE OpportunityId = :parentId
        ];
    }

    @AuraEnabled
    public static String insertInvoice(List<OpportunityLineItem> lstOpportunityLineItem) {
        if (lstOpportunityLineItem == null || lstOpportunityLineItem.isEmpty()) {
            return 'No line items provided for invoice creation.';
        }

        List<invoice__c> lstInvoices = new List<invoice__c>();
        for (OpportunityLineItem lineItem : lstOpportunityLineItem) {
            invoice__c objInvoice = new invoice__c(
                Account__c = lineItem.Opportunity.AccountId,
                Due_Date__c = lineItem.Opportunity.Invoice_Due_Date__c,
                Invoice_Date__c = lineItem.Opportunity.CloseDate,
                Invoice_Reference__c = 'This Invoice is been generated from Opportunity.'
            );
            lstInvoices.add(objInvoice);
        }

        try {
            insert lstInvoices;
            return 'Invoices inserted successfully';
        } catch (Exception ex) {
            return 'Error while inserting invoices: ' + ex.getMessage();
        }
    }
}