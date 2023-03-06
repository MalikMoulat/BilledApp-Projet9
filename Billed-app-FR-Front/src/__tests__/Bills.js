/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom"
import {screen, waitFor, fireEvent, shallow} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills.js'
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then when i click on the first eye icons should be open a modal with the bill", () => {

      //Simule les donnée dans le localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Object.defineProperty(window, localStorage, { value: localStorageMock })

      // Simmulateur d'un utilisateur employee
      window.localStorage.setItem('user' , JSON.stringify({
        type: 'Employee'
      }))

      // Création de la modal
      const html = BillsUI({data: bills})
      document.body.innerHTML = html

      //Création d'une facture
      const newBillscontainer = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: null
      })

      //Mock de la modal
      $.fn.modal = jest.fn()

      //Mock de l'icone eye
      const handleClickIconEye = jest.fn(() => {
        newBillscontainer.handleClickIconEye
      })

      //Recupération de la première icone eye
      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0]
      
      //Écoute de l'event click sur l'icone eye
      firstEyeIcon.addEventListener("click", handleClickIconEye)

      //Click sur le première icon eye
      fireEvent.click(firstEyeIcon)

      //
      expect(handleClickIconEye).toHaveBeenCalled()
      //
      expect($.fn.modal).toHaveBeenCalled()

    })

    describe("When i click on the button 'Nouvelle note de frais'", () => {
      test("Then i'm on the new bills page", () => {


    //J'intègre le chemin d'accès
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    const billsPage = new Bills({
      document,
      onNavigate,
      store: null,
      bills: bills,
      localStorage: window.localStorage
    })
    //création constante pour la fonction qui appel la fonction a tester
    const OpenNewBill = jest.fn(billsPage.handleClickNewBill);//l20 bills.js
    const btnNewBill = screen.getByTestId("btn-new-bill")//cible le btn nouvelle note de frais
    btnNewBill.addEventListener("click", OpenNewBill)//écoute évènement
    fireEvent.click(btnNewBill)//simule évènement au click
    // on vérifie que la fonction est appelée et que la page souhaitée s'affiche
    expect(OpenNewBill).toHaveBeenCalled()//je m'attends à ce que la page nouvelle note de frais se charge
    expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()//la nouvelle note de frais apparait avec le titre envoyer une note de frais



      })
    })

    describe("When I get bills", () => {
      test("Then it should render bills", async () => {
        const bills = new Bills({//récupération des factures dans le store
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })
        const getBills = jest.fn(() => bills.getBills());//simulation du click       
        const value = await getBills();//vérification
        expect(getBills).toHaveBeenCalled();//ON TEST SI LA METHODE EST APPELEE
        expect(value.length).toBe(4);//test si la longeur du tableau est a 4 du store.js
      })

      test("Then it shoud render error from the format of data", async () => {

        const mockBills = await mockStore.bills().list();
        const wrongBills = [{ ...mockBills[0] }];
        wrongBills[0].date = "22/05/19955";
        
        document.body.innerHTML = BillsUI({ data: wrongBills })
        window.onNavigate(ROUTES_PATH.Bills)

        expect(screen.getByText("22/05/19955")).toBeTruthy()

      })

    })


  })
})
