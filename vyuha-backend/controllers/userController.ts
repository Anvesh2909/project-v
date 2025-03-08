import {getUser, getUsers, updateUserPhoto} from "../services/userService";
import { Request, Response } from "express";

export const getUserController = (req: Request, res: Response) => {
    const { id } = req.body;
    getUser(id).then((response) => {
        res.status(200).json(response);
    }).catch((error) => {
        res.status(400).json(error);
    });
};

export const updateUserPhotoController = async (req: Request, res: Response) => {
    const { id } = req.body;
    const photoBuffer = req.file?.buffer;
    const mimetype = req.file?.mimetype; // Get file type

    if (!photoBuffer || !mimetype) {
        return res.status(400).json({ error: "No photo uploaded or invalid file type" });
    }

    try {
        const response = await updateUserPhoto(id, photoBuffer, mimetype);
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in updateUserPhotoController:", error);
        res.status(500).json({ error: "Failed to update photo" });
    }
};
export const getUsersController = async (req: Request, res: Response) => {
    try {
        const response = await getUsers();
        res.status(200).json(response);
    } catch (error) {
        console.error("Error in getUsersController:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}