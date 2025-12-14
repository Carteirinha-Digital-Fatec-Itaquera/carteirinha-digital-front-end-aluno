export class RecoveryPassword {
    email: string;
    code: string;
    newPassword: string;

    constructor(props: { email: string, code: string, newPassword: string }) {
        this.email = props.email;
        this.code = props.code;
        this.newPassword = props.newPassword;
    }
}
