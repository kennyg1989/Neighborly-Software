/// <reference types="cypress" />

// Fill any input/textarea by matching its <label> text
Cypress.Commands.add('fillFieldByLabel', (labelText, value) => {
  cy.contains('label', labelText)
    .invoke('attr', 'for')
    .then((id) => {
      cy.get(`#${id}`)
        .clear({ force: true })
        .type(value, { force: true });
    });
});

// Fill a date input by label (supports MM/DD/YYYY and YYYY-MM-DD)
Cypress.Commands.add('fillDateByLabel', (labelText, dateString) => {
  let formatted = dateString;

  // If MM/DD/YYYY, convert to YYYY-MM-DD for <input type="date">
  if (dateString.includes('/')) {
    const [mm, dd, yyyy] = dateString.split('/');
    formatted = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  cy.contains('label', labelText)
    .invoke('attr', 'for')
    .then((id) => {
      cy.get(`#${id}`)
        .clear({ force: true })
        .type(formatted, { force: true });
    });
});

// Sign up as a given role and ensure we end authenticated
Cypress.Commands.add('signUpAsRole', (role) => {
  const timestamp = Date.now();
  const email = `auto_${role.replace(/\s/g, '').toLowerCase()}_${timestamp}@example.com`;
  const password = 'Password123!';

  cy.visit('/auth');

  // Open Sign Up tab
  cy.contains('button', 'Sign Up').click();

  // Fill form
  cy.fillFieldByLabel('Full Name', `Auto ${role}`);

  // Role select (Radix-style combobox with id="role")
  cy.get('#role').click({ force: true });

  // Wait for the Radix dropdown content to actually render
  cy.get('[role="option"]', { timeout: 5000 }).should('be.visible');

  // Now click the option — always force due to Radix pointer-events animation
  cy.contains('[role="option"]', role).click({ force: true });

  cy.fillFieldByLabel('Email', email);
  cy.fillFieldByLabel('Password', password);

  // Submit Sign Up
  cy.contains('button', 'Create Account').click();

  cy.wait(2000);
  cy.location('pathname', { timeout: 10000 }).then((path) => {
    if (path.includes('/auth')) {
      // Still not logged in → perform manual login
      cy.contains('button', /^Login$/i).click(); // switch to Login tab

      cy.fillFieldByLabel('Email', email);
      cy.fillFieldByLabel('Password', password);

      cy.contains('button', /Login|Sign In/i).click();
    }
  });

  Cypress.Commands.add('selectByLabel', (labelText, optionText) => {
  cy.contains('label', labelText)
    .parent()
    .find('select')
    .select(optionText, { force: true }); // underlying select is visually hidden
});


  // Ensure we are authenticated before returning
  cy.location('pathname', { timeout: 10000 }).should((p) => {
    expect(p).not.to.include('/auth');
  });

  return cy.wrap({ email, password });
});
