/// <reference types="cypress" />

function uniqueProgramName(prefix = 'Automation Program') {
  return `${prefix} ${Date.now()}`;
}

describe('Program Management - QA Assessment Requirements', () => {
  it('Program Staff can create, list, and view programs correctly', () => {
    const programName = uniqueProgramName();
    const category = 'Housing';
    const totalBudget = 100000;
    const maxAward = 5000;

    //
    // 1) Sign up & log in as Program Staff
    //
    cy.signUpAsRole('Program Staff');

    //
    // 2) Navigate to Create Program
    //
    cy.visit('/programs/create');

    //
    // 3) Fill form with valid data
    //
    cy.fillFieldByLabel('Program Name', programName);
    cy.fillFieldByLabel('Category', category);
    cy.fillFieldByLabel('Total Budget', totalBudget.toString());
    cy.fillFieldByLabel('Max Award Per Application', maxAward.toString());

    // Dates: helper auto-converts from MM/DD/YYYY → YYYY-MM-DD input format
    cy.fillDateByLabel('Open Date', '01/14/2026');
    cy.fillDateByLabel('Close Date', '12/31/2026');

    // (Status left as default Draft)

    cy.fillFieldByLabel(
      'Description',
      'Automation-created program for the Neighborly QA assessment.'
    );

    //
    // 4) Create
    //
    cy.contains('button', 'Create Program').click();

    //
    // 5) Should redirect back to program list
    //
    cy.url().should('include', '/programs');

    //
    // 6) Search for the newly created program
    //
    cy.get('input[placeholder="Search programs by name or category..."]')
      .clear()
      .type(programName);

    //
    // 7) Confirm it appears in the table with correct summary info
    //
    cy.contains('td', programName)
      .should('exist')
      .closest('tr')
      .as('programRow');

    cy.get('@programRow').within(() => {
      cy.contains(category).should('exist');
      cy.contains('$100,000').should('exist');  // formatted currency
      cy.contains('$5,000').should('exist');    // formatted currency
      cy.contains(/draft/i).should('exist');    // status badge text

      // Open Date cell should be a readable date, not "N/A"
      cy.get('td')
        .eq(5) // 0: name, 1: category, 2: budget, 3: max, 4: status, 5: open date
        .invoke('text')
        .then((text) => {
          const trimmed = text.trim();
          expect(trimmed).to.not.equal('N/A');
          expect(trimmed).to.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        });
    });

    //
    // 8) Click to view the detail page
    //
    cy.get('@programRow').click();

    cy.url().should('match', /\/programs\/.+/);

    //
    // 9) Validate detail page content
    //
    
    // Title & category
    cy.contains('h1', programName).should('exist');
    cy.contains('p', category).should('exist');       // category under title

    // Description
    cy.contains('Description').should('exist');
    cy.contains('Automation-created program for the Neighborly QA assessment.').should('exist');

    // Total Budget block
    cy.contains('Total Budget').should('exist');
    cy.contains('$100,000').should('exist');

    // Max Award Per Application block
    cy.contains('Max Award Per Application').should('exist');
    cy.contains('$5,000').should('exist');

    // Status chip (draft)
    cy.contains(/draft/i).should('exist');

    // Timeline dates – just ensure readable dates are present
    cy.contains('Open Date').should('exist');
    cy.contains('Close Date').should('exist');
    cy.contains('Created').should('exist');

    // At least one date string in M/D/YYYY format should be present in the timeline card
    cy.contains(/\d{1,2}\/\d{1,2}\/\d{4}/).should('exist');
  });
});
