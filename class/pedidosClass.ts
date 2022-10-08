import { Response } from "express";
import { CallbackError } from "mongoose";
const mongoose = require("mongoose");
import { customAlphabet } from "nanoid";
import { environment } from "../environment/environment";

import moment from "moment";
moment.locale("es");

// Modelo 
import pedidoModel from "../models/pedidoModel";

// Interface
import { PedidosInterface } from "../interfaces/pedidos";

import Server from "./server";

export class PedidosClass {
  private idRef: any;

  constructor() {
    this.idRef = customAlphabet("1234567890", 6);
  }

  crearPedido(req: any, resp: Response): void {
    const idReferencia: string = this.idRef();
    const cliente = new mongoose.Types.ObjectId(req.body.cliente);
    const vendedor = new mongoose.Types.ObjectId(req.body.vendedor);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);
    const fechaRegistro: string = req.body.fechaRegistro;
    const fechaEntrega: string = req.body.fechaEntrega;
    const prioridad = new mongoose.Types.ObjectId(req.body.prioridad);
    const etapa = new mongoose.Types.ObjectId(req.body.etapa);

    const crearNuevoPedido = new pedidoModel({
      idReferencia,
      cliente,
      vendedor,
      sucursal,
      fechaRegistro,
      fechaEntrega,
      prioridad,
      etapa,
    });

    crearNuevoPedido.save(
      async (err: CallbackError, pedidoDB: PedidosInterface) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: `Error interno`,
            err,
          });
        } else {
          return resp.json({
            ok: true,
            mensaje: `Pedido creado`,
            pedidoDB,
          });
        }
      }
    );
  }

  async obtenerPedidos(req: any, resp: Response): Promise<any> {
    const pedidosDB = await pedidoModel.aggregate([
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
        },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidosDB,
      });
    }
  }

  async obtenerPedido(req: any, resp: Response): Promise<any> {
    const _id = new mongoose.Types.ObjectId(req.get("id"));
    const pedidosDB = await pedidoModel.aggregate([
      {
        $match: { _id },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "vendedor",
          foreignField: "_id",
          as: "vendedor",
        },
      },
      {
        $lookup: {
          from: "userclients",
          localField: "cliente",
          foreignField: "_id",
          as: "cliente",
          pipeline: [
            {
              $lookup: {
                from: "sucursales",
                localField: "sucursal",
                foreignField: "_id",
                as: "sucursal",
              },
            },
            {
              $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "sucursales",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {
        $lookup: {
          from: "prioridads",
          localField: "prioridad",
          foreignField: "_id",
          as: "prioridad",
        },
      },
      {
        $lookup: {
          from: "etapas",
          localField: "etapa",
          foreignField: "_id",
          as: "etapa",
        },
      },
      {
        $lookup: {
          from: "colores",
          localField: "color",
          foreignField: "_id",
          as: "color",
        },
      },
      {
        $lookup: {
          from: "origenpedidos",
          localField: "origen",
          foreignField: "_id",
          as: "origen",
        },
      },
      {
        $lookup: {
          from: "userworkers",
          localField: "diseniador",
          foreignField: "_id",
          as: "diseniador",
        },
      },
      {
        $lookup: {
          from: "productos-pedidos",
          localField: "_id",
          foreignField: "pedido",
          as: "productosPedidos",
          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "producto",
                foreignField: "_id",
                as: "producto",
              },
            },
            {
              $unwind: { path: "$producto", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
      {
        $unwind: { path: "$vendedor", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$cliente", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$sucursal", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$prioridad", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$etapa", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$color", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$origen", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$diseniador", preserveNullAndEmptyArrays: true },
      },
    ]);

    if (!pedidosDB) {
      return resp.json({
        ok: false,
        mensaje: "Error al obtener los pedidos",
      });
    } else {
      return resp.json({
        ok: true,
        pedidoDB: pedidosDB[0],
      });
    }
  }

  editarInfo(req: any, resp: Response): void {
    const _id = new mongoose.Types.ObjectId(req.body.id);
    const fechaEntrega = req.body.fechaEntrega;
    const prioridad = new mongoose.Types.ObjectId(req.body.prioridad);
    const etapa = new mongoose.Types.ObjectId(req.body.etapa);
    const diseniador = new mongoose.Types.ObjectId(req.body.diseniador);
    const color = new mongoose.Types.ObjectId(req.body.color);
    const origen = new mongoose.Types.ObjectId(req.body.origen);
    const vendedor = new mongoose.Types.ObjectId(req.body.vendedor);
    const sucursal = new mongoose.Types.ObjectId(req.body.sucursal);

    const query = {
      fechaEntrega,
      prioridad,
      etapa,
      diseniador,
      color,
      origen,
      vendedor,
      sucursal,
    };

    pedidoModel.findByIdAndUpdate(
      _id,
      query,
      { new: true },
      (err: any, pedidoDB: any) => {
        if (err) {
          return resp.json({
            ok: false,
            mensaje: "Error al actualizar info del pedido",
            err,
          });
        } else {
          return resp.json({
            ok: true,
            pedidoDB,
          });
        }
      }
    );
  }

  editarITBMS(req: any, resp: Response): void {}
}
