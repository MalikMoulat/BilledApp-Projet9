/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

window.alert = jest.fn()
jest.mock("../app/Store", () => mockStore)

// Étant donné que je suis connecté en tant qu'employé
describe("Given i am connected as an employee", () => {

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

  // Quand je suis sur la page NewBill
  describe("When i am on NewBill page", () => {
    // Alors la nouvelle note de frais reste sur l'écran
    test("Then the NewBill stay on screen", () => {

      // Nouvelle note de frais
      const html = NewBillUI()
      document.body.innerHTML = html

      // Date
      const date = screen.getByTestId("datepicker")
      expect(date.value).toBe("")

      // Montant
      const montantTTC = screen.getByTestId("amount")
      expect(montantTTC.value).toBe("")

      // Fichier joint
      const fichierJoint = screen.getByTestId("file")
      expect(fichierJoint.value).toBe("")

      // Recupération du formulaire
      const formNewBill = screen.getByTestId("form-new-bill")
      // Le formulaire est bien présent
      expect(formNewBill).toBeTruthy()

      // Création de la fonction pour stoper l'action par default
      const sendNewBill = jest.fn((e) => e.preventDefault())

      // Écoute l'event du bouton envoie du formulaire avec la fonction senNewBill
      formNewBill.addEventListener("submit", sendNewBill)

      // Simule un clique sur le bouton d'envoie du formulaire
      fireEvent.submit(formNewBill)

      // Aprés le clique le formulaire doit être toujours visible
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

    })
  })

  // J'ajoute un ficher joint au bon format
  describe("When i download the attached file in the correct format ", () => {
    // La nouvelle note de frais et envoyé
    test ("Then the newbill is sent", () => {
      
      // Simulation de la page note de frais
      const html = NewBillUI()         
      document.body.innerHTML = html

      const onNavigate = (pathname) => {  
        document.body.innerHTML = ROUTES({ pathname })
      }

      // Création d'une nouvelle instance newBill
      const newBill = new NewBill({ //je crée une nouvelle instance newbill
        document,
        onNavigate,
        store: mockStore,
        localStorage: window, localStorage,
      })

      // Création constante pour fonction qui appel la fonction a tester
      const LoadFile = jest.fn((e) => newBill.handleChangeFile(e))//chargement du fichier
      
      // Recupération du champ du fichier
      const fichier = screen.getByTestId("file")

      // Condition du test
      const testFormat = new File(["c'est un test"],  "test.jpg", { type: "image/jpg" })


      // Écoute l'event
      fichier.addEventListener("change", LoadFile)

      // Évènement au change en relation avec la condition du test
      fireEvent.change(fichier, {target: {files: [testFormat]}})
      
      // Je vérifie que le fichier est bien chargé
      expect(LoadFile).toHaveBeenCalled()

      // Je vérifie que le fichier téléchargé est bien conforme à la condition du test
      expect(fichier.files[0]).toStrictEqual(testFormat)
  
      // Cible le formulaire
      const formNewBill = screen.getByTestId('form-new-bill')
      expect(formNewBill).toBeTruthy()
  
      // Simule la fonction
      const sendNewBill = jest.fn((e) => newBill.handleSubmit(e))

      // Évènement au submit
      formNewBill.addEventListener('submit', sendNewBill)

      // Simule l'évènement
      fireEvent.submit(formNewBill)
      expect(sendNewBill).toHaveBeenCalled()

      // Lorsqu'on créer une nouvelle note de frais on verifie s'il est bien redirigé vers la page d'accueil
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })


  })

})

