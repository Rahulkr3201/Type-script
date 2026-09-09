// ==========================================
// src/services/user.service.ts
// ==========================================
// A "service" holds LOGIC. It imports the models it works with.
// `../` goes up one folder: services/ -> src/ -> then into models/

import type { User, UserRole } from "../models/user";
import { DEFAULT_ROLE } from "../models/user";
import Logger from "../utils/logger";

// `import type` above imports ONLY types -- see modules.ts section 8 for why.
// `DEFAULT_ROLE` is a real runtime value, so it uses a normal import.

export class UserService {
    private readonly logger = new Logger("UserService");

    getUser(): User {
        this.logger.log("fetching user");
        return {
            id: 1,
            name: "Rahul",
            email: "rahul@gmail.com",
            role: DEFAULT_ROLE
        };
    }

    promote(user: User, role: UserRole): User {
        this.logger.log(`promoting ${user.name} to ${role}`);
        return { ...user, role };
    }
}
