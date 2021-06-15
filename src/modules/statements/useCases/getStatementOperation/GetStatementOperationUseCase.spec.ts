import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get statement operation", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository()
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
        createUserUseCase = new CreateUserUseCase(usersRepository);
    });

    it("should be able to get statement operation of a user", async () => {
        let user = await createUserUseCase.execute({
            name: "Henrique",
            email: "henrique@avanade.com",
            password: "1234"
        })

        const statement2 = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Amount test"
        })

        const statement1 = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.WITHDRAW,
            amount: 800,
            description: "Amount test"
        })

        const statement = await getStatementOperationUseCase.execute({
            user_id: user.id as string,
            statement_id: statement1.id as string
        });

        expect(statement.amount).toBe(800);
        expect(statement.type).toBe('withdraw');
    });

    it("should not be able to get non-existing statement operation", () => {
        expect(async () => {
            let user = await createUserUseCase.execute({
                name: "Henrique",
                email: "henrique@avanade.com",
                password: "1234"
            })

            const statement = await createStatementUseCase.execute({
                user_id: user.id as string,
                type: OperationType.WITHDRAW,
                amount: 800,
                description: "Amount test"
            })

            await getStatementOperationUseCase.execute({
                user_id: "user non-existing",
                statement_id: statement.id as string,
            });
        }).rejects.toBeInstanceOf(AppError);
    });

    it("should not be able to get statement operation of non-existing user", () => {
        expect(async () => {
            let user = await createUserUseCase.execute({
                name: "Henrique",
                email: "henrique@avanade.com",
                password: "1234"
            });

            await getStatementOperationUseCase.execute({
                user_id: user.id as string,
                statement_id: "statement non-existing"
            });
        }).rejects.toBeInstanceOf(AppError);
    });
})