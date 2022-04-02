import { Request, Response } from "express";
import { CallbackError, Mongoose } from "mongoose";
const mongoose = require("mongoose");
import moment from "moment";
import bitacoraModel from "../models/bitacoraModel";
import { BitacoraInterface } from "../interfaces/bitacora";

moment.locale("es");

export class BitacoraClass {
  crearBitacora(data: any): void {
    const fechaReg = moment().format("DD-MM-YYYY kk:mm");
    const datosNuevos = { ...data, fechaReg };
    const crearBitacora = new bitacoraModel(datosNuevos);
    crearBitacora.save(
      (err: CallbackError, bitacoraDB: BitacoraInterface) => {}
    );
  }

  obtenerBitacoraPorPedido(req: any, resp: Response): void {
    const idPedido = new mongoose.Types.ObjectId(req.get("idPedido"));
    bitacoraModel
      .find({ idPedido })
      .populate("usuario")
      .populate("idPedido")
      .exec((err: CallbackError, bitacoraDB: Array<BitacoraInterface>) => {
        if (err) {
          return resp.json({
            ok: false,
            error: "Error interno",
            err,
          });
        }

        // console.log(bitacoraDB);

        return resp.json({
          ok: true,
          bitacoraDB,
        });
      });
  }

  obtenerBitacoras(): void {}

  obtenerBitacoraDia(): void {}

  obtenerBitacorasUsuario(): void {}
}
