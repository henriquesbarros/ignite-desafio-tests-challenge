import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get balance", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    });

    it("should be able to list all statements", async () => {
        let user = await createUserUseCase.execute({
            name: "Henrique",
            email: "henrique@avanade.com",
            password: "1234"
        })

        await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.DEPOSIT,
            amount: 1000,
            description: "Amount test"
        })

        await createStatementUseCase.execute({
            user_id: user.id as string,
            type: OperationType.WITHDRAW,
            amount: 800,
            description: "Amount test"
        })

        let balance = await getBalanceUseCase.execute({ user_id: user.id as string });

        expect(balance.statement.length).toBe(2)
        expect(balance.balance).toEqual(200)
    });

    it("should not be able to get balance for non-existing user", () => {
        expect(async () => {
            await getBalanceUseCase.execute({ user_id: 'nonexistent_user_id' });
        }).rejects.toBeInstanceOf(AppError);
    })
});