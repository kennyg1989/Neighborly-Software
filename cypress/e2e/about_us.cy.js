// Reusable helper (top-level, not inside an `it`)
const acceptCookiesIfPresent = () => {
  cy.get('body').then(($b) => {
    if ($b.find('#cookie_action_close_header').length) {
      cy.get('#cookie_action_close_header').click({ force: true });
    }
  });
};

describe('Neighborly About Us', () => {
  beforeEach(() => {
    cy.viewport(1280, 900); // Desktop viewport to avoid responsive hiding
  });

  it('loads and shows key sections', () => {
    cy.visit('/about-us/');
    acceptCookiesIfPresent();

    cy.title().should('include', 'About Us');

    cy.contains(/Our Mission/i)
      .scrollIntoView()
      .should('be.visible');

    cy.contains(/Meet Our Executive Leadership Team/i)
      .scrollIntoView()
      .should('be.visible');

    cy.contains(/Our Core Values/i)
      .scrollIntoView()
      .should('be.visible');
  });

  it('opens Jigesh Parikh modal and validates content', () => {
    cy.visit('/about-us/');
    acceptCookiesIfPresent();
    
    // Ensure leadership section is visible (Elementor can duplicate/animate headings)
    cy.contains(/Meet Our Executive Leadership Team/i)
      .scrollIntoView()
      .should('be.visible');
    
    // Click the visible Jigesh card (Elementor often wraps in <a href="javascript:void(0)">)
    cy.contains(':visible', /Jigesh\s+Parikh/i)
      .closest('a, [role="link"], .elementor-widget, .ekit-team, .card')
      .click({ force: true });
    
    // Wait for modal/dialog to become visible
    cy.get('body').then(($b) => {
      if ($b.find('[role="dialog"]').length) {
        cy.get('[role="dialog"]:visible', { timeout: 10000 }).should('be.visible');
      } else if ($b.find('.modal, .dialog, .elementor-lightbox').length) {
        cy.get('.modal:visible, .dialog:visible, .elementor-lightbox:visible', { timeout: 10000 })
          .should('be.visible');
      }
    });
    
    // Validate modal content — use :visible to skip hidden templates
    cy.contains(':visible', /Jigesh\s+Parikh/i).should('be.visible');
    cy.contains(':visible', /Chief Technology Officer|CTO/i).should('be.visible');
    
    // Optional quality checks
    cy.get('img:visible').should('exist'); // headshot present
    cy.get('p:visible').its('length').should('be.gte', 1); // some bio text exists
    
    // Close the modal safely (close button or ESC)
    cy.get('body').then(($b) => {
      if ($b.find('[aria-label="Close"], .modal-close, .elementor-lightbox-close').length) {
        cy.get('[aria-label="Close"], .modal-close, .elementor-lightbox-close')
          .filter(':visible').first().click({ force: true });
      } else {
        cy.get('body').type('{esc}');
      }
    });
    
    // Assert modal is closed
    cy.get('[role="dialog"], .modal, .dialog, .elementor-lightbox').should('not.be.visible');
  });

  it('navigates to Partners page and validates Request Information link', () => {
  cy.visit('/partners/');
  
  // Accept cookies if banner present
  cy.get('body').then(($b) => {
    if ($b.find('#cookie_action_close_header').length) {
      cy.get('#cookie_action_close_header').click({ force: true });
    }
  });

  // Confirm we’re on the correct page
  cy.title().should('match', /Partner|Partners/i);

  // Scroll to and click the Request Information button/link
  cy.contains(':visible', /Request Information/i)
    .scrollIntoView()
    .should('be.visible')
    .click({ force: true });

  // Wait for any navigation or modal to complete
  cy.wait(2000);

  // Validate the page or modal loads correctly (no 404 text visible)
  cy.contains(/404/i).should('not.exist');

  // Optional: confirm a form or header exists
  cy.get('body').then(($body) => {
    if ($body.find('form').length) {
      cy.get('form').should('be.visible');
    } else {
      cy.contains(/Request|Information|Partner/i).should('be.visible');
    }
  });
});

});
