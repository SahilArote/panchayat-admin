import * as Yup from 'yup'

export interface AuthFormValues {
    username: string
    password: string
}

export const schema = Yup.object().shape({
    username: Yup.string()
        .trim()
        .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
        .required('Mobile Number is required'),
    password: Yup.string()
        .trim()
        .required('Password is required'),
})