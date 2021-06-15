import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Create statement", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to create a new deposit", async () => {
        const user = await createUserUseCase.execute({
            name: "Henrique",
            email: "henrique@avanade.com",
            password: "1234"
        });

        const statement = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: "deposit" as OperationType,
            amount: 1000,
            description: "Amount test"
        });

        expect(statement).toHaveProperty("id");
    });

    it("should be able to create a new withdraw", async () => {
        const user = await createUserUseCase.execute({
            name: "Henrique",
            email: "henrique@avanade.com",
            password: "1234"
        });

        await createStatementUseCase.execute({
            user_id: user.id as string,
            type: "deposit" as OperationType,
            amount: 1000,
            description: "Amount test"
        });

        const statement = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: "withdraw" as OperationType,
            amount: 500,
            description: "Amount test"
        });

        expect(statement).toHaveProperty("id");
    });

    it("should no be able to withdraw when don't have an amount", () => {
        expect(async () => {
            const user = await createUserUseCase.execute({
                name: "Henrique",
                email: "henrique@avanade.com",
                password: "1234"
            });

            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: "deposit" as OperationType,
                amount: 1000,
                description: "Amount test"
            });

            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: "withdraw" as OperationType,
                amount: 1500,
                description: "Amount test"
            });
        }).rejects.toBeInstanceOf(AppError);
    });

    it("should no be able to create a new statement for non-existing user", () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "non-existing user",
                type: "deposit" as OperationType,
                amount: 1000,
                description: "Amount test"
            });
        }).rejects.toBeInstanceOf(AppError);
    })
});