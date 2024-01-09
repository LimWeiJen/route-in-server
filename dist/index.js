"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("./firebase");
const auth_1 = require("@firebase/auth");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const updateUsersData = () => __awaiter(void 0, void 0, void 0, function* () {
    const usersDoc = yield (0, firestore_1.getDocs)((0, firestore_1.collection)(firebase_1.db, 'users'));
    const users = [];
    const userIds = [];
    const todaysDay = new Date().getDay();
    usersDoc.forEach(user => {
        userIds.push(user.id);
        users.push(user.data());
    });
    users.forEach((user, i) => __awaiter(void 0, void 0, void 0, function* () {
        let totalTaskCompleted = 0;
        let totalTasks = 0;
        user.taskGroups.forEach((taskGroup) => {
            const taskGroupAppearanceDay = taskGroup.dayOfAppearance.flatMap((bool, index) => bool ? index : []);
            if (taskGroupAppearanceDay.includes(todaysDay)) {
                taskGroup.tasks.forEach(task => {
                    if (task.status !== 'ignored') {
                        totalTasks++;
                        task.totalDay++;
                        if (task.status === 'checked') {
                            task.totalCompletionDay++;
                            totalTaskCompleted++;
                        }
                    }
                    task.status = 'unchecked';
                });
            }
            taskGroup.tasks.forEach(task => {
                task.status = 'unchecked';
            });
        });
        if (totalTasks === 0 && totalTaskCompleted === 0)
            user.analytics.completionRateByDay.push(100);
        else {
            if (totalTasks === 0)
                totalTasks = 1;
            user.analytics.completionRateByDay.push(totalTaskCompleted / totalTasks * 100);
        }
        user.lastLogInDay = diffBtwDates(new Date(user.analytics.dateOfCreation), new Date());
        yield (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'users', userIds[i]), user);
    }));
});
const diffBtwDates = (date1, date2) => {
    if (!date1)
        return 0;
    const diff = Math.abs(date2.getTime() - new Date(date1).getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));
};
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, auth_1.signInAnonymously)(firebase_1.auth).then(() => {
        console.log('signed in');
    }).catch((err) => {
        console.error(err);
    });
    const serverSettingsData = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_1.db, 'admin', 'serverSettings'));
    const updatedUserData = serverSettingsData.data().updatedUserData;
    console.log(updatedUserData);
    // if it is time to update user data
    if (new Date().getUTCHours() === 16 && !updatedUserData) {
        updateUsersData().then(() => {
            console.log('success');
            (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'admin', 'serverSettings'), { updatedUserData: true });
        });
    }
    if (new Date().getUTCHours() !== 16)
        (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_1.db, 'admin', 'serverSettings'), { updatedUserData: false });
}), 6000);
app.get('/', (req, res) => res.send('hello world'));
app.listen(3000, () => console.log('server running'));
