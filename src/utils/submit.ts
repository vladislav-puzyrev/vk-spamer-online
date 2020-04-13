import { addLogItem, setSpamOnRun } from '../redux/spamer-reducer'
import { IValues } from '../types/types'
import store from '../redux/store'
import Spamer from './Spamer'

// Валидирует данные и начинает спам
function submit (
  values: IValues,
  setFieldError: (field: string, message: string) => void,
  addLog: () => void,
) {
  const accounts = store.getState().accountsReducer.accounts

  const validate = () => {
    if (!accounts.length) {
      store.dispatch(addLogItem('Нету ни одного аккаунта', 'warning', false, Date.now().toString()))
    } else if (!accounts.some(account => account.isEnabled)) {
      store.dispatch(addLogItem('Все аккаунты выключены', 'warning', false, Date.now().toString()))
    }

    if (!values.addressees.length) setFieldError('addressees', 'Укажите адресаты спама')
    if (!values.message && !values.attachment) {
      setFieldError('message', 'Сообщение обязательно если не указаны вложения')
      setFieldError('attachment', 'Вложения обязательны если не указано сообщение')
    }
  }
  validate()

  if (
    (values.message || values.attachment) &&
    values.addressees.length &&
    accounts.length &&
    accounts.some(account => account.isEnabled)
  ) {
    store.dispatch(setSpamOnRun(true))
    addLog()

    new Spamer({
      ...values,
      message: values.message.split('\n').join('%0A'),
    }).start()
  }
}

export default submit
