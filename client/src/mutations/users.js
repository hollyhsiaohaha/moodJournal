import { gql } from '@apollo/client';

export const SIGN_IN = gql`
mutation SignIn($signInInput: SignInInput!) {
  signIn(signInInput: $signInInput) {
    _id
    name
    email
    jwtToken
  }
}
`;

export const SIGN_UP = gql`
mutation SignUp($signUpInput: SignUpInput!) {
  signUp(signUpInput: $signUpInput) {
    _id
    name
    email
    jwtToken
  }
}
`;
