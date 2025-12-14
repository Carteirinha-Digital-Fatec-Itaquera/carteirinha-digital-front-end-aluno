export class Auth {
    email: string;
    password: string;

    constructor(props: {
        email: string;
        password: string;
    }) {
        this.email = props.email;
        this.password = props.password;
    }
}
