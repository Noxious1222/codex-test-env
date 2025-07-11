import argparse, logging, os
from final_rap_ai import scraper, preprocess, trainer, generator
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
p=argparse.ArgumentParser("Final Rap AI CLI"); sub=p.add_subparsers(dest='cmd',required=True)
s=sub.add_parser('scrape'); s.add_argument('--artists',nargs='+'); s.add_argument('--token',default=os.getenv('GENIUS_TOKEN')); s.add_argument('--out',default='data/raw.txt'); s.add_argument('--max-songs',type=int,default=200)
pr=sub.add_parser('prep'); pr.add_argument('--in',dest='inp',default='data/raw.txt'); pr.add_argument('--out',default='data/clean.txt')
tr=sub.add_parser('train'); tr.add_argument('--corpus',default='data/clean.txt'); tr.add_argument('--out',default='models/rap-lora'); tr.add_argument('--base',default=trainer.DEFAULT); tr.add_argument('--epochs',type=int,default=3); tr.add_argument('--batch',type=int,default=1)
g=sub.add_parser('gen'); g.add_argument('--model-dir',default='models/rap-lora'); g.add_argument('--prompt',default='<INTRO>\n'); g.add_argument('--max',type=int,default=400)
args=p.parse_args()
if args.cmd=='scrape':
    if not args.token: p.error('Need Genius token'); scraper.scrape(args.artists,args.token,args.out,max_songs=args.max_songs)
elif args.cmd=='prep':
    preprocess.preprocess(args.inp,args.out)
elif args.cmd=='train':
    trainer.train(corpus=args.corpus,out=args.out,base=args.base,epochs=args.epochs,batch=args.batch)
elif args.cmd=='gen':
    print(generator.generate(model_dir=args.model_dir,prompt=args.prompt,max_new=args.max))
