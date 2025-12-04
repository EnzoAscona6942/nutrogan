describe('Prueba de Seguridad - Login', () => {
  it('Bloquea el acceso y muestra error con credenciales falsas', () => {
    // 1. Visitar la página de login (Ajusta el puerto si tu Quasar no usa el 9000)
    cy.visit('http://localhost:9000/#/login')

    // 2. Verificar que la página cargó (Busca textos de tu LoginPage.vue)
    cy.contains('Bienvenido a Nutrogan').should('be.visible')

    // 3. Escribir credenciales falsas

    cy.get('input[type="email"]').type('hacker@test.com')
    cy.get('input[type="password"]').type('password123')

    // 4. Hacer clic en el botón "Iniciar Sesión"

    cy.get('button[type="submit"]').click()

    // 5. Verificar que aparece la alerta de error

    cy.get('.error-box').should('be.visible')

    cy.contains('Credenciales incorrectas').should('be.visible')
  })
})
