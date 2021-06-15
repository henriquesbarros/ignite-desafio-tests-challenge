import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("List user", () => {
    beforeEach(()=> {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    });

    it("should be able to list a user", async () => {
        const user = await createUserUseCase.execute({
            name: "Henrique",
            email: "henrique@avanade.com",
            password: "1234"
        });

        const userFound = await showUserProfileUseCase.execute(user.id as string);
        expect(userFound).toEqual(user);
    });

    it("should be able to list a user", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute("non-existent user");
        }).rejects.toBeInstanceOf(AppError);
    });
});