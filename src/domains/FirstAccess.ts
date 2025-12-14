export class FirstAccess {
    cpf: string | null;
    code: string | null;
    password: string | null;

    constructor(props: {
        cpf: string | null,
        code: string | null,
        password: string | null
    }) {
        this.cpf = props.cpf;
        this.code = props.code;
        this.password = props.password;
    }
}
