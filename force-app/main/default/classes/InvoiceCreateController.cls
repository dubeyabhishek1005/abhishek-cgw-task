public with sharing class InvoiceCreateController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOpportunityDetails(Id opportunityId) {
        Opportunity opp = [SELECT Id, AccountId, CloseDate, Invoice_Due_Date__c,
                           (SELECT Id, Name, Quantity, UnitPrice FROM OpportunityLineItems)
                           FROM Opportunity WHERE Id = :opportunityId LIMIT 1];
        
        Map<String, Object> invoiceData = new Map<String, Object>();
        invoiceData.put('account', opp.AccountId);
        invoiceData.put('invoiceDate', opp.CloseDate);
        invoiceData.put('dueDate', opp.Invoice_Due_Date__c); 
        
        List<Map<String, Object>> lineItems = new List<Map<String, Object>>();
        for (OpportunityLineItem oli : opp.OpportunityLineItems) {
            Map<String, Object> lineItem = new Map<String, Object>();
            lineItem.put('Name', oli.Name);
            lineItem.put('Quantity', oli.Quantity);
            lineItem.put('UnitPrice', oli.UnitPrice);
            lineItems.add(lineItem);
        }
        invoiceData.put('lineItems', lineItems);
        return invoiceData;
    }
}
